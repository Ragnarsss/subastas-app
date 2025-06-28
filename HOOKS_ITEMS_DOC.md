# Hooks para Items - Documentación

## Hooks Disponibles en useItems.ts

### 1. useItems()
Hook para obtener todos los items disponibles.

```typescript
const { items, loading, error, refetch, createItem, clearError } = useItems();
```

### 2. useItemById(itemId: string)
Hook para obtener un item específico por su ID.

```typescript
const { item, loading, error, refetch, clearError } = useItemById("684725c984c79bea713cae95");
```

### 3. useUserItems()
Hook para obtener los items del usuario actual.

```typescript
const { 
  items, 
  availableItems, 
  auctionedItems, 
  loading, 
  error, 
  refetch, 
  createItem, 
  clearError 
} = useUserItems();
```

### 4. useCreateAuctionItem() ⭐ NUEVO
Hook específico para crear items en subasta.

```typescript
const { createAuctionItem, loading, error, clearError } = useCreateAuctionItem();

// Ejemplo de uso
const result = await createAuctionItem({
  name: "play 4",
  initialPrice: 220000.0,
  description: "PS4 en perfecto estado",
  endDate: "2025-06-01T12:00:00Z",
  categories: ["Gaming", "Consolas"]
});

if (result.success) {
  console.log("Item creado con ID:", result.itemId);
} else {
  console.error("Error:", result.error);
}
```

## Ejemplo Completo de Componente

### Formulario Básico de Creación de Item
```typescript
import React from 'react';
import { useCreateAuctionItem } from '../hooks/useItems';

const CreateItemForm = () => {
  const { createAuctionItem, loading, error, clearError } = useCreateAuctionItem();

  const handleSubmit = async (formData) => {
    const result = await createAuctionItem({
      name: formData.name,
      initialPrice: parseFloat(formData.price),
      description: formData.description,
      endDate: formData.endDate,
      categories: formData.categories.split(',')
    });

    if (result.success) {
      alert('¡Item creado exitosamente!');
      // Redirigir o limpiar formulario
    } else {
      alert('Error: ' + result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error">
          {error}
          <button type="button" onClick={clearError}>×</button>
        </div>
      )}
      
      <input name="name" placeholder="Nombre del item" required />
      <input name="price" type="number" placeholder="Precio inicial" required />
      <textarea name="description" placeholder="Descripción" required />
      <input name="endDate" type="datetime-local" required />
      <input name="categories" placeholder="Categorías (separadas por coma)" required />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Item'}
      </button>
    </form>
  );
};
```

### Integración en CreateAuction.tsx (Componente Real) ⭐ ACTUALIZADO
El componente `CreateAuction.tsx` ahora usa `useCreateAuctionItem` en lugar de `useAuctionAPI`:

```typescript
// En CreateAuction.tsx
import { useCreateAuctionItem } from "../../hooks/useItems";

function CreateAuction() {
  const {
    createAuctionItem,
    loading: apiLoading,
    error: apiError,
    clearError,
  } = useCreateAuctionItem();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      clearError();

      // Calculate endDate based on duration
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(form.duration));

      const itemData = {
        name: form.title,
        description: form.description,
        initialPrice: parseFloat(form.startingBid),
        endDate: endDate.toISOString(),
        categories: [form.category],
      };

      const result = await createAuctionItem(itemData);

      if (!result.success) {
        throw new Error(result.error || "Error creating auction item");
      }

      alert("¡Item de subasta creado exitosamente!");
      navigate("/auctions");
    } catch (error) {
      console.error("Error al crear item de subasta:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ... resto del componente
}
```
```

## GraphQL Mutation Correspondiente

La mutación GraphQL que se ejecuta internamente es:

```graphql
mutation CreateItem($input: CreateItemInput!) {
  createItem(input: $input)
}
```

Con el input:
```graphql
{
  "input": {
    "name": "play 4",
    "userId": "12345", // Se obtiene automáticamente del localStorage
    "initialPrice": 220000.0,
    "description": "PS4 en perfecto estado",
    "endDate": "2025-06-01T12:00:00Z",
    "isAuctioned": true, // Siempre true para useCreateAuctionItem
    "categories": ["Gaming", "Consolas"]
  }
}
```

## Diferencias entre los hooks

- **useItems.createItem()**: Para crear items generales (isAuctioned puede ser true/false)
- **useCreateAuctionItem()**: Específico para items en subasta (isAuctioned siempre true)
- **useUserItems.createItem()**: Para crear items del usuario actual

Todos los hooks manejan automáticamente:
- Autenticación del usuario
- Manejo de errores
- Estados de carga
- Logging para debugging
