import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import RecepcionForm from "../components/RecepcionForm";
import { mapFormDataToRecepcionPayload, mapRecepcionToFormData } from "../lib/recepciones";
import { useFormRecepcion } from "../lib/useFormRecepcion";
import { supabase } from "../lib/supabase";

function EditarRecepcion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formData, setFormData, handleChange } = useFormRecepcion();
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  useEffect(() => {
    const cargarRecepcion = async () => {
      setCargando(true);
      setErrorCarga("");

      const { data, error } = await supabase
        .from("recepciones")
        .select("*")
        .eq("id", Number(id))
        .maybeSingle();

      if (error) {
        console.error("Error al cargar la recepción:", error);
        setErrorCarga("No se pudo cargar la recepción.");
        setCargando(false);
        return;
      }

      if (!data) {
        setErrorCarga("Recepción no encontrada.");
        setCargando(false);
        return;
      }

      setFormData(mapRecepcionToFormData(data));
      setCargando(false);
    };

    cargarRecepcion();
  }, [id, setFormData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("recepciones")
      .update(mapFormDataToRecepcionPayload(formData))
      .eq("id", Number(id));

    if (error) {
      console.error("Error al actualizar:", error);
      toast.error(`Error al actualizar: ${error.message}`);
      return;
    }

    toast.success("Recepción actualizada correctamente");
    navigate("/");
  };

  if (cargando) return <p>Cargando recepción...</p>;
  if (errorCarga) return <p>{errorCarga}</p>;

  return (
    <div>
      <h2>Editar recepción</h2>
      <RecepcionForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}

export default EditarRecepcion;
