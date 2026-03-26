import 'dotenv/config'
import { PrismaClient, RoleName } from '@prisma/client'

const prisma = new PrismaClient()

const roles: { name: RoleName; description: string }[] = [
  {
    name: RoleName.ADMIN,
    description: 'Administrador con acceso completo a todas las funcionalidades'
  },
  {
    name: RoleName.USER,
    description: 'Usuario regular con acceso básico'
  },
  {
    name: RoleName.MODERATOR,
    description: 'Moderador con permisos de gestión'
  },
  {
    name: RoleName.GUEST,
    description: 'Invitado con acceso limitado'
  },
  {
    name: RoleName.CLIENT,
    description: 'Cliente con acceso a funcionalidades específicas'
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
