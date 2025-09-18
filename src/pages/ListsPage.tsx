import { useNavigate } from 'react-router-dom';

const ListsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Listas
          </h1>
          <p className="text-muted-foreground">
            Pantalla de listas - próximamente
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListsPage;