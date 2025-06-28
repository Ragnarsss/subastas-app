import { useUserName, useUserById, useUsersMap } from '../hooks/useUser';
import UserName from '../components/UserName';
import { Box, Typography, Card, CardContent, Avatar, Chip } from '@mui/material';

// Ejemplo de uso de los nuevos hooks y componente UserName
const UserNameExamples = () => {
  // IDs de ejemplo (en la aplicación real vendrían de props o estado)
  const userId1 = "683f251902fb33d805f52810";
  const userId2 = "683f251902fb33d805f52811";
  const userIds = [userId1, userId2, "683f251902fb33d805f52812"];

  // Ejemplo 1: Componente UserName directo (MÁS RECOMENDADO)
  const Example1 = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          1. Uso directo del componente UserName
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography>Nombre básico: <UserName userId={userId1} /></Typography>
          <Typography>Con avatar: <UserName userId={userId1} showAvatar={true} /></Typography>
          <Typography>Con fallback: <UserName userId="invalid-id" fallback="Usuario no encontrado" /></Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // Ejemplo 2: Hook useUserName para lógica simple
  const Example2 = () => {
    const { userName, loading } = useUserName(userId1);
    
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            2. Hook useUserName para lógica personalizada
          </Typography>
          <Typography>
            {loading ? "Cargando nombre..." : `Bienvenido, ${userName}!`}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  // Ejemplo 3: Hook useUserById para información completa
  const Example3 = () => {
    const { user, loading, error } = useUserById(userId1);
    
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            3. Hook useUserById para información completa
          </Typography>
          {loading && <Typography>Cargando usuario...</Typography>}
          {error && <Typography color="error">Error: {error}</Typography>}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={user.avatar}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Chip 
                  label={user.role} 
                  size="small" 
                  color={user.role === 'ADMIN' ? 'primary' : 'default'} 
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Ejemplo 4: Hook useUsersMap para múltiples usuarios
  const Example4 = () => {
    const { users, loading } = useUsersMap(userIds);
    
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            4. Hook useUsersMap para múltiples usuarios
          </Typography>
          {loading && <Typography>Cargando usuarios...</Typography>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {userIds.map(id => {
              const user = users.get(id);
              return (
                <Typography key={id}>
                  {id.substring(0, 8)}: {user ? user.name : 'Cargando...'}
                </Typography>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Ejemplo 5: Uso en contexto de subasta (similar a AuctionDetail)
  const Example5 = () => {
    const sellerId = userId1;
    const bidderIds = [userId1, userId2, "683f251902fb33d805f52812"];
    
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            5. Ejemplo en contexto de subasta
          </Typography>
          
          {/* Información del vendedor */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Vendedor:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24 }}>
                {sellerId.charAt(0).toUpperCase()}
              </Avatar>
              <UserName userId={sellerId} />
            </Box>
          </Box>

          {/* Lista de oferentes */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Oferentes recientes:
            </Typography>
            {bidderIds.map((bidderId, index) => (
              <Box key={bidderId} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                  {bidderId.charAt(0).toUpperCase()}
                </Avatar>
                <UserName userId={bidderId} />
                {index === 0 && (
                  <Chip label="GANANDO" color="success" size="small" />
                )}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Ejemplos de Integración de Nombres de Usuario
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Los siguientes ejemplos muestran cómo usar los nuevos hooks y componentes para mostrar nombres reales de usuario en lugar de IDs.
      </Typography>

      <Example1 />
      <Example2 />
      <Example3 />
      <Example4 />
      <Example5 />

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ✅ Casos de Uso Implementados
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li">
              <strong>AuctionDetail.tsx:</strong> Vendedor y oferentes muestran nombres reales
            </Typography>
            <Typography component="li">
              <strong>LiveBidding.tsx:</strong> Pujas en tiempo real con nombres reales
            </Typography>
            <Typography component="li">
              <strong>Mensajes de Socket:</strong> Notificaciones con nombres de usuario
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserNameExamples;
