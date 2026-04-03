import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const roles: { name: 'ADMINISTRADOR' | 'USUARIO' | 'MODERADOR' | 'INVITADO' | 'CLIENTE' | 'EMPRESA'; description: string }[] = [
  {
    name: 'ADMINISTRADOR',
    description: 'Administrador con acceso completo a todas las funcionalidades'
  },
  {
    name: 'USUARIO',
    description: 'Usuario regular con acceso básico'
  },
  {
    name: 'MODERADOR',
    description: 'Moderador con permisos de gestión'
  },
  {
    name: 'INVITADO',
    description: 'Invitado con acceso limitado'
  },
  {
    name: 'CLIENTE',
    description: 'Cliente con acceso a funcionalidades específicas'
  },
  {
    name: 'EMPRESA',
    description: 'Empresa con acceso a funcionalidades específicas'
  }
]

async function main() {
  console.log('Seeding roles...')

  for (const role of roles) {
    const existing = await prisma.role.findUnique({
      where: { name: role.name }
    })

    if (!existing) {
      await prisma.role.create({ data: role })
      console.log(`Created role: ${role.name}`)
    } else {
      console.log(`Role already exists: ${role.name}`)
    }
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
