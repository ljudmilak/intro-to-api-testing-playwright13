import { expect, test } from '@playwright/test'

import { StatusCodes } from 'http-status-codes'
import { ProductDTO, ProductSchema, Product } from '../src/dto/ProductDTO'

test.describe('Lesson 11 -> Product API tests', () => {
  const BaseEndpointURL = 'https://backend.tallinn-learning.ee/products'
  const AUTH = { 'X-API-Key': 'my-secret-api-key' }

  test('GET /products - check API returns array with length >= 1', async ({ request }) => {
    const response = await request.get(BaseEndpointURL, {
      headers: AUTH,
    })

    const responseBody: Product[] = await response.json()
    const firstProduct: Product = ProductSchema.parse(responseBody[0])
    expect(firstProduct.createdAt).toBeNull()
    expect(response.status()).toBe(StatusCodes.OK)
    expect(responseBody.length).toBeDefined()
    expect(responseBody.length).toBeGreaterThanOrEqual(1)
  })

  test('POST /products; GET /products/{id} - check product creation and product search by id', async ({
    request,
  }) => {
    const testProduct = ProductDTO.generateDefault()

    const createResponse = await request.post(BaseEndpointURL, {
      headers: AUTH,
      data: testProduct,
    })

    const createResponseBody: ProductDTO = await createResponse.json()
    expect(createResponseBody.id).toBeGreaterThan(0)
    expect(createResponseBody.name).toBe(testProduct.name)
    expect(createResponseBody.price).toBe(testProduct.price)
    expect(createResponseBody.createdAt).toBeDefined()

    const searchResponse = await request.get(`${BaseEndpointURL}/${createResponseBody.id}`, {
      headers: AUTH,
    })
    const searchResponseBody: ProductDTO = await searchResponse.json()
    expect(searchResponse.status()).toBe(StatusCodes.OK)
    expect.soft(searchResponseBody.id).toBe(createResponseBody.id)
    expect.soft(searchResponseBody.name).toBe(testProduct.name)
    expect.soft(searchResponseBody.price).toBe(testProduct.price)
    expect.soft(searchResponseBody.createdAt).toBeDefined()
  })

  test('DELETE /products - check not existing product deletion', async ({ request }) => {
    const deleteResponse = await request.delete(`${BaseEndpointURL}/-1`, {
      headers: AUTH,
    })

    expect(deleteResponse.status()).toBe(400)
  })

  test('DELETE /products - check product deletion', async ({ request }) => {
    const testProduct = ProductDTO.generateCustom('fabric test', 1000)

    const createResponse = await request.post(BaseEndpointURL, {
      headers: AUTH,
      data: testProduct,
    })
    const createResponseBody: ProductDTO = await createResponse.json()

    const deleteResponse = await request.delete(`${BaseEndpointURL}/${createResponseBody.id}`, {
      headers: AUTH,
    })

    expect(deleteResponse.status()).toBe(204)
  })
})
