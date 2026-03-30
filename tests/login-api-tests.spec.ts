import { expect, test } from '@playwright/test'
import { LoginDTO, LoginSchema } from '../src/dto/LoginDTO'
import { z } from "zod"

test.describe('Login api tests', () => {
  const BaseEndpointURL = 'https://backend.tallinn-learning.ee/login/student'

  test('Incorrect login', async ({ request }) => {
    const loginResponse = await request.post(BaseEndpointURL, {
      data: LoginDTO.generateIncorrectPair(),
    })
    expect(loginResponse.status()).toBe(401)
  })

  test('Correct login', async ({ request }) => {
    console.log(LoginDTO.generateCorrectPair())
    const loginResponse = await request.post(BaseEndpointURL, {
      data: LoginDTO.generateCorrectPair(),
    })

    const token: z.infer<typeof LoginSchema> = await loginResponse.text()
    const TestToken = LoginSchema.parse(token);
    console.log(TestToken);
    expect(loginResponse.status()).toBe(200)
    expect(token.length).toBeGreaterThan(0)
  })
})
