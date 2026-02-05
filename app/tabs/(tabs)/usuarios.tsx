import { ScrollView } from 'react-native';
import { useState } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Icon, UsersIcon, UserCheckIcon, UserXIcon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  fechaRegistro: string;
  activo: boolean;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: '1',
      nombre: 'Juan Perez',
      email: 'juan@inventario.com',
      rol: 'Administrador',
      fechaRegistro: '2024-01-15',
      activo: true,
    },
    {
      id: '2',
      nombre: 'Maria Garcia',
      email: 'maria@inventario.com',
      rol: 'Supervisor',
      fechaRegistro: '2024-02-20',
      activo: true,
    },
    {
      id: '3',
      nombre: 'Carlos Lopez',
      email: 'carlos@inventario.com',
      rol: 'Operador',
      fechaRegistro: '2024-03-10',
      activo: false,
    },
  ]);

  const [busqueda, setBusqueda] = useState('');

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const toggleEstado = (id: string) => {
    setUsuarios(
      usuarios.map((usuario) =>
        usuario.id === id ? { ...usuario, activo: !usuario.activo } : usuario
      )
    );
  };

  return (
    <Box className="flex-1 bg-[#000000]">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box className="p-6">
          {/* Header */}
          <HStack className="items-center justify-between mb-8">
            <VStack>
              <Heading className="text-3xl font-bold text-[#FFD700]">
                Usuarios
              </Heading>
              <Text className="text-[#B8860B]">
                Gestion de usuarios del sistema
              </Text>
            </VStack>
            <Button className="bg-[#FFD700] rounded-xl px-6">
              <ButtonText className="text-black font-bold">
                + Nuevo
              </ButtonText>
            </Button>
          </HStack>

          {/* Busqueda */}
          <Box className="mb-6">
            <Input className="bg-[#1a1a1a] rounded-xl border border-[#FFD700]">
              <InputField
                placeholder="Buscar usuario por nombre o email..."
                value={busqueda}
                onChangeText={setBusqueda}
                className="text-base text-[#FFD700]"
                placeholderTextColor="#B8860B"
              />
            </Input>
          </Box>

          {/* Estadisticas */}
          <HStack className="space-x-4 mb-8">
            <Box className="flex-1 bg-[#1a1a1a] border border-[#FFD700] p-4 rounded-xl">
              <Text className="text-[#FFD700] text-2xl font-bold text-center">
                {usuarios.length}
              </Text>
              <Text className="text-[#B8860B] text-center">
                Usuarios
              </Text>
            </Box>
            <Box className="flex-1 bg-[#1a1a1a] border border-[#FFD700] p-4 rounded-xl">
              <Text className="text-[#FFD700] text-2xl font-bold text-center">
                {usuarios.filter((u) => u.activo).length}
              </Text>
              <Text className="text-[#B8860B] text-center">
                Activos
              </Text>
            </Box>
            <Box className="flex-1 bg-[#1a1a1a] border border-[#FFD700] p-4 rounded-xl">
              <Text className="text-[#FFD700] text-2xl font-bold text-center">
                {usuarios.filter((u) => !u.activo).length}
              </Text>
              <Text className="text-[#B8860B] text-center">
                Inactivos
              </Text>
            </Box>
          </HStack>

          {/* Lista de Usuarios */}
          <VStack className="space-y-4">
            {usuariosFiltrados.map((usuario) => (
              <Box
                key={usuario.id}
                className="bg-[#1a1a1a] border border-[#FFD700] rounded-xl p-4"
              >
                <HStack className="items-center justify-between">
                  <HStack className="items-center space-x-4">
                    <Box
                      className={`w-12 h-12 rounded-full items-center justify-center ${
                        usuario.activo ? 'bg-[#2a2a2a]' : 'bg-[#111111]'
                      }`}
                    >
                      <Icon
                        as={UsersIcon}
                        size="lg"
                        className={usuario.activo ? 'text-[#FFD700]' : 'text-[#B8860B]'}
                      />
                    </Box>
                    <VStack>
                      <Text className="font-bold text-lg text-[#FFD700]">
                        {usuario.nombre}
                      </Text>
                      <Text className="text-[#B8860B]">{usuario.email}</Text>
                      <HStack className="space-x-2 mt-1">
                        <Text className="text-sm bg-[#2a2a2a] text-[#FFD700] border border-[#FFD700] px-2 py-1 rounded">
                          {usuario.rol}
                        </Text>
                        <Text className="text-sm bg-[#111111] text-[#B8860B] border border-[#B8860B] px-2 py-1 rounded">
                          {usuario.fechaRegistro}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>

                  <Button
                    onPress={() => toggleEstado(usuario.id)}
                    className={`px-4 py-2 rounded-lg border ${
                      usuario.activo
                        ? 'bg-[#2a2a2a] border-[#FFD700]'
                        : 'bg-[#111111] border-[#B8860B]'
                    }`}
                  >
                    {usuario.activo ? (
                      <HStack className="items-center space-x-2">
                        <Icon as={UserXIcon} size="sm" className="text-[#FFD700]" />
                        <Text className="text-[#FFD700] font-bold">Desactivar</Text>
                      </HStack>
                    ) : (
                      <HStack className="items-center space-x-2">
                        <Icon as={UserCheckIcon} size="sm" className="text-[#B8860B]" />
                        <Text className="text-[#B8860B] font-bold">Activar</Text>
                      </HStack>
                    )}
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>

          {/* Mensaje si no hay usuarios */}
          {usuariosFiltrados.length === 0 && (
            <Box className="bg-[#1a1a1a] border border-[#FFD700] rounded-xl p-8 items-center mt-8">
              <Icon as={UsersIcon} size="xl" className="text-[#B8860B] mb-4" />
              <Text className="text-[#B8860B] text-center">
                No se encontraron usuarios
              </Text>
            </Box>
          )}
        </Box>
      </ScrollView>
    </Box>
  );
}


