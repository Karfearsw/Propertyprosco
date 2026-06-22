import dotenv from 'dotenv'
import { validateEnvContract, type ValidationTarget } from './env-contract'

dotenv.config({ path: process.env.ENV_FILE ?? '.env' })

function parseTarget(args: string[]): ValidationTarget {
  const targetArg = args.find((arg) => arg.startsWith('--target='))
  if (!targetArg) {
    return 'local'
  }

  const value = targetArg.slice('--target='.length)
  if (value === 'local' || value === 'production') {
    return value
  }

  throw new Error(`Unsupported validation target: ${value}`)
}

function printMessages(label: string, messages: string[]) {
  for (const message of messages) {
    console.log(`[env] ${label}: ${message}`)
  }
}

try {
  const target = parseTarget(process.argv.slice(2))
  const report = validateEnvContract(process.env, target)

  if (report.errors.length === 0) {
    console.log(`[env] ${target} validation passed`)
  } else {
    console.error(`[env] ${target} validation failed`)
    printMessages('error', report.errors)
  }

  if (report.warnings.length > 0) {
    printMessages('warning', report.warnings)
  }

  process.exitCode = report.errors.length === 0 ? 0 : 1
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown validation error'
  console.error(`[env] ${message}`)
  process.exitCode = 1
}
