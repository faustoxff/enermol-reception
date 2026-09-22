// Cliente que habla con las funciones serverless en /api, imitando la
// interfaz mínima de supabase-js que ya usan las páginas.

import { obtenerToken } from "./authClient";

const encabezadosAutenticados = async (extra = {}) => {
  const token = await obtenerToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

class RemoteQuery {
  constructor(tabla) {
    this.tabla = tabla;
    this.mode = "select";
    this.filtroId = null;
    this.payload = null;
  }

  select() {
    return this;
  }

  insert(filas) {
    this.mode = "insert";
    this.payload = filas;
    return this;
  }

  update(payload) {
    this.mode = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.mode = "delete";
    return this;
  }

  eq(columna, valor) {
    if (columna === "id") {
      this.filtroId = valor;
    }
    return this;
  }

  order() {
    // El endpoint ya devuelve las recepciones ordenadas por id descendente.
    return this;
  }

  maybeSingle() {
    return this._ejecutar().then(({ data, error }) => ({
      data: Array.isArray(data) ? (data[0] ?? null) : data,
      error,
    }));
  }

  async _ejecutar() {
    const base = `/api/${this.tabla}`;

    try {
      if (this.mode === "insert") {
        const respuesta = await fetch(base, {
          method: "POST",
          headers: await encabezadosAutenticados({ "Content-Type": "application/json" }),
          body: JSON.stringify(this.payload),
        });
        return await this._leerRespuesta(respuesta);
      }

      if (this.mode === "update") {
        const respuesta = await fetch(`${base}/${this.filtroId}`, {
          method: "PATCH",
          headers: await encabezadosAutenticados({ "Content-Type": "application/json" }),
          body: JSON.stringify(this.payload),
        });
        return await this._leerRespuesta(respuesta);
      }

      if (this.mode === "delete") {
        const respuesta = await fetch(`${base}/${this.filtroId}`, {
          method: "DELETE",
          headers: await encabezadosAutenticados(),
        });

        if (!respuesta.ok) {
          return { data: null, error: { message: await respuesta.text() } };
        }

        return { data: null, error: null };
      }

      const url = this.filtroId != null ? `${base}/${this.filtroId}` : base;
      const respuesta = await fetch(url, { headers: await encabezadosAutenticados() });
      return await this._leerRespuesta(respuesta);
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async _leerRespuesta(respuesta) {
    if (!respuesta.ok) {
      return { data: null, error: { message: await respuesta.text() } };
    }

    if (respuesta.status === 204) {
      return { data: null, error: null };
    }

    return { data: await respuesta.json(), error: null };
  }

  then(resolve, reject) {
    return this._ejecutar().then(resolve, reject);
  }
}

export const remoteDb = {
  from(tabla) {
    return new RemoteQuery(tabla);
  },
  functions: {
    async invoke(nombre, { body } = {}) {
      if (nombre !== "send-recepcion-email") {
        return { data: null, error: { message: `Función desconocida: ${nombre}` } };
      }

      try {
        const respuesta = await fetch("/api/enviar-recepcion-email", {
          method: "POST",
          headers: await encabezadosAutenticados({ "Content-Type": "application/json" }),
          body: JSON.stringify(body),
        });

        if (!respuesta.ok) {
          return { data: null, error: { message: await respuesta.text() } };
        }

        return { data: await respuesta.json(), error: null };
      } catch (error) {
        return { data: null, error: { message: error.message } };
      }
    },
  },
};
