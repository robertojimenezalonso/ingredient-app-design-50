import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NewExplorePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-6">
          Nueva Pantalla de Exploración
        </h1>
        <p className="text-muted-foreground mb-8">
          Esta es la nueva pantalla que aparece después de la configuración
        </p>
        <Button onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
};

export default NewExplorePage;