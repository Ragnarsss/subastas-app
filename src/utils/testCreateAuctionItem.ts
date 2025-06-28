// Archivo de prueba para el hook useCreateAuctionItem
// Uso: Importar este archivo en cualquier componente para probar

import { useCreateAuctionItem } from '../hooks/useItems';

export const testCreateAuctionItem = async () => {
  console.log("=== TESTING useCreateAuctionItem ===");
  
  // Simular datos de prueba basados en el formulario CreateAuction
  const testData = {
    name: "PlayStation 5 - Test",
    initialPrice: 650000,
    description: "PlayStation 5 en perfecto estado, incluye control DualSense",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
    categories: ["Tecnología", "Gaming"]
  };

  console.log("Test data:", testData);
  
  try {
    // Nota: Este test requiere que el hook se ejecute dentro de un componente React
    // const { createAuctionItem } = useCreateAuctionItem();
    // const result = await createAuctionItem(testData);
    
    console.log("Para ejecutar este test:");
    console.log("1. Importa este archivo en CreateAuction.tsx");
    console.log("2. Llama a testCreateAuctionItem() en un botón de prueba");
    console.log("3. Verifica en la consola que se crean los items correctamente");
    
    return testData;
  } catch (error) {
    console.error("Error en test:", error);
    throw error;
  }
};

export const testDataExamples = [
  {
    name: "iPhone 14 Pro",
    initialPrice: 800000,
    description: "iPhone 14 Pro 256GB en excelente estado",
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    categories: ["Tecnología", "Smartphones"]
  },
  {
    name: "MacBook Air M2",
    initialPrice: 1200000,
    description: "MacBook Air M2 8GB RAM 256GB SSD como nuevo",
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    categories: ["Tecnología", "Computadores"]
  },
  {
    name: "Bicicleta de Montaña",
    initialPrice: 350000,
    description: "Bicicleta Trek 29'' en excelente estado",
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    categories: ["Deporte", "Ciclismo"]
  }
];

// Función helper para formatear datos de prueba
export const formatTestData = (data: any) => {
  return {
    ...data,
    formattedPrice: new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(data.initialPrice),
    formattedEndDate: new Date(data.endDate).toLocaleString("es-CL"),
    categoriesString: data.categories.join(", ")
  };
};
