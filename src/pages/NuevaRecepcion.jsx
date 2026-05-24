import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import RecepcionForm from "../components/RecepcionForm";
import { mapFormDataToRecepcionPayload } from "../lib/recepciones";
import { useFormRecepcion } from "../lib/useFormRecepcion";
import { supabase } from "../lib/supabase";

function NuevaRecepcion() {
  const navigate = useNavigate();
  const { formData, handleChange } = useFormRecepcion();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: savedData, error } = await supabase
      .from("recepciones")
      .insert([mapFormDataToRecepcionPayload(formData)])
      .select("id")
      .single();

    if (error) {
      console.error("Error al guardar:", error);
      toast.error(`Error al guardar: ${error.message}`);
      return;
    }

    toast.success("Recepción guardada correctamente");
    navigate("/");

    if (formData.email.trim()) {
      supabase.functions
        .invoke("send-recepcion-email", {
          body: { recepcionId: savedData.id, destinatario: formData.email.trim() },
        })
        .then(({ error: emailError }) => {
          if (emailError) {
            toast.error("La recepción fue guardada pero no se pudo enviar el email al cliente");
          } else {
            toast.success(`Email de confirmación enviado a ${formData.email.trim()}`);
          }
        })
        .catch(() => {
          toast.error("La recepción fue guardada pero no se pudo enviar el email al cliente");
        });
    }
  };

  return (
    <div>
      <h2>Nueva recepción</h2>
      <RecepcionForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Guardar recepción"
      />
    </div>
  );
}

export default NuevaRecepcion;
