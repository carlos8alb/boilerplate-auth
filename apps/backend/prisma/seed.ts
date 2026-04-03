import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const roles: { name: 'ADMIN' | 'USER' | 'MODERATOR' | 'GUEST' | 'CLIENT' | 'COMPANY'; displayName: string; description: string }[] = [
  {
    name: 'ADMIN',
    displayName: 'Administrador',
    description: 'Administrador con acceso completo a todas las funcionalidades'
  },
  {
    name: 'USER',
    displayName: 'Usuario',
    description: 'Usuario regular con acceso básico'
  },
  {
    name: 'MODERATOR',
    displayName: 'Moderador',
    description: 'Moderador con permisos de gestión'
  },
  {
    name: 'GUEST',
    displayName: 'Invitado',
    description: 'Invitado con acceso limitado'
  },
  {
    name: 'CLIENT',
    displayName: 'Cliente',
    description: 'Cliente con acceso a funcionalidades específicas'
  },
  {
    name: 'COMPANY',
    displayName: 'Empresa',
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
