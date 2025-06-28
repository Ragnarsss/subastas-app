# Hook useUserItemsWithBids - Documentación

El hook `useUserItemsWithBids` extiende la funcionalidad del hook `useUserItems` para incluir información detallada de pujas para cada item del usuario.

## Características

- ✅ Obtiene todos los items del usuario autenticado
- ✅ Para cada item, obtiene todas las pujas asociadas
- ✅ Calcula estadísticas de pujas (total, promedio, etc.)
- ✅ Incluye información de la puja más reciente
- ✅ Maneja estados de carga y errores
- ✅ Proporciona datos de fallback en caso de errores

## Uso

```typescript
import { useUserItemsWithBids } from '../../hooks/useUserItemsWithBids';

function MyItemsComponent() {
  const {
    items,              // Todos los items del usuario con información de pujas
    availableItems,     // Items disponibles (no en subasta)
    auctionedItems,     // Items en subasta
    loading,            // Estado de carga
    error,              // Mensajes de error
    refetch,            // Función para recargar datos
    clearError,         // Función para limpiar errores
  } = useUserItemsWithBids();

  // ... resto del componente
}
```

## Interfaz ItemWithBids

Cada item incluye toda la información básica del item más:

```typescript
interface ItemWithBids {
  // Datos básicos del item
  _id: string;
  name: string;
  userId: string;
  initialPrice: number;
  currentHighestBid?: number;
  highestBidderId?: string;
  description: string;
  endDate: string;
  isAuctioned: boolean;
  categories: string[];
  image?: string;
  views?: number;
  status: "available" | "auctioned" | "sold" | "expired";
  
  // Información de pujas
  totalBids: number;           // Número total de pujas
  bids: BidInfo[];             // Array con todas las pujas
  latestBid?: BidInfo;         // Información de la puja más reciente
  hasActiveBids: boolean;      // Si el item tiene pujas activas
}
```

## Interfaz BidInfo

```typescript
interface BidInfo {
  id: string;
  amount: number;
  user_id: string;
  created_at: string;
  userName?: string;    // Nombre formateado del usuario
  timeAgo?: string;     // Tiempo transcurrido desde la puja
}
```

## Estadísticas de Pujas

El hook se puede combinar con funciones auxiliares para calcular estadísticas:

```typescript
const getBidStats = (items: ItemWithBids[]) => {
  const totalBids = items.reduce((sum, item) => sum + item.totalBids, 0);
  const itemsWithBids = items.filter(item => item.hasActiveBids).length;
  const totalValue = items.reduce((sum, item) => {
    return sum + (item.currentHighestBid || item.initialPrice);
  }, 0);

  return {
    totalBids,
    itemsWithBids,
    totalValue,
    averageBidsPerItem: items.length > 0 ? (totalBids / items.length).toFixed(1) : "0",
  };
};
```

## Ejemplo de Implementación en MyItems.tsx

```typescript
function MyItems() {
  const {
    items,
    availableItems,
    auctionedItems,
    loading,
    error,
    refetch,
    clearError,
  } = useUserItemsWithBids();

  // Calcular estadísticas
  const bidStats = getBidStats(items);

  // Mostrar estadísticas en la UI
  return (
    <Container>
      {/* Estadísticas de Pujas */}
      {bidStats.totalBids > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">📊 Estadísticas de Pujas</Typography>
          <Grid container spacing={3}>
            <Grid xs={3}>
              <Typography variant="h4">{bidStats.totalBids}</Typography>
              <Typography variant="body2">Pujas Totales</Typography>
            </Grid>
            <Grid xs={3}>
              <Typography variant="h4">{bidStats.itemsWithBids}</Typography>
              <Typography variant="body2">Items con Pujas</Typography>
            </Grid>
            {/* ... más estadísticas */}
          </Grid>
        </Paper>
      )}

      {/* Lista de Items */}
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid xs={12} sm={6} md={4} key={item._id}>
            <Card>
              {/* Información del item */}
              <CardContent>
                <Typography variant="h6">{item.name}</Typography>
                
                {/* Información de pujas */}
                {item.isAuctioned && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Pujas: {item.totalBids}
                    </Typography>
                    
                    {item.latestBid && (
                      <Box sx={{ bgcolor: "grey.50", p: 1, borderRadius: 1 }}>
                        <Typography variant="body2">
                          Última puja: ${item.latestBid.amount}
                        </Typography>
                        <Typography variant="caption">
                          {item.latestBid.timeAgo} por {item.latestBid.userName}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
```

## Manejo de Errores

El hook incluye manejo robusto de errores:

- Si falla la carga de items, muestra un error
- Si fallan las pujas de un item específico, continúa con datos parciales
- Incluye datos de fallback para desarrollo/testing
- Permite limpiar errores manualmente

## Optimizaciones

- Usa `useCallback` para optimizar re-renders
- Carga de pujas en paralelo para mejor rendimiento
- Cacheo automático a través de GraphQL client
- Estados de carga granulares

## GraphQL Queries Utilizadas

1. `getItemsByUser` - Obtiene items del usuario
2. `listBids` - Obtiene pujas para cada item

## Notas Técnicas

- Requiere usuario autenticado (lee `userId` de localStorage)
- Compatible con el sistema de autenticación existente
- Integra con el cliente GraphQL configurado
- Maneja formateo de fechas y montos automáticamente
