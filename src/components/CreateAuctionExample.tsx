// Ejemplo de uso del hook useCreateAuctionItem
import { useCreateAuctionItem } from '../hooks/useItems';

const CreateAuctionExample = () => {
  const { createAuctionItem, loading, error, clearError } = useCreateAuctionItem();

  const handleCreateAuction = async () => {
    // Ejemplo basado en tu GraphQL mutation
    const result = await createAuctionItem({
      name: "play 4",
      initialPrice: 220000.0,
      description: "PS4 en perfecto estado",
      endDate: "2025-06-01T12:00:00Z",
      categories: ["Gaming", "Consolas"]
    });

    if (result.success) {
      console.log("Item creado con ID:", result.itemId);
      alert("¡Item creado exitosamente!");
    } else {
      console.error("Error creando item:", result.error);
      alert("Error: " + result.error);
    }
  };

  const handleCreateAnotherExample = async () => {
    // Otro ejemplo
    const result = await createAuctionItem({
      name: "iPhone 14 Pro",
      initialPrice: 800000.0,
      description: "iPhone 14 Pro en excelente estado, con caja original",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días desde ahora
      categories: ["Tecnología", "Smartphones"]
    });

    if (result.success) {
      console.log("Item creado con ID:", result.itemId);
      alert("¡Item creado exitosamente!");
    }
  };

  return (
    <div>
      <h2>Crear Items en Subasta</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {error}
          <button onClick={clearError}>X</button>
        </div>
      )}
      
      <button 
        onClick={handleCreateAuction} 
        disabled={loading}
        style={{ marginRight: '10px' }}
      >
        {loading ? 'Creando...' : 'Crear PlayStation 4'}
      </button>
      
      <button 
        onClick={handleCreateAnotherExample} 
        disabled={loading}
      >
        {loading ? 'Creando...' : 'Crear iPhone 14 Pro'}
      </button>
      
      <h3>Uso del hook:</h3>
      <pre>{`
import { useCreateAuctionItem } from '../hooks/useItems';

const { createAuctionItem, loading, error, clearError } = useCreateAuctionItem();

const result = await createAuctionItem({
  name: "play 4",
  initialPrice: 220000.0,
  description: "PS4 en perfecto estado",
  endDate: "2025-06-01T12:00:00Z",
  categories: ["Gaming", "Consolas"]
});

if (result.success) {
  console.log("Item creado con ID:", result.itemId);
}
      `}</pre>
    </div>
  );
};

export default CreateAuctionExample;
