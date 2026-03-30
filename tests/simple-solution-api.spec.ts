import { expect, test } from '@playwright/test'

import { StatusCodes } from 'http-status-codes'
import { OrderDTO, OrderSchema } from '../src/dto/OrderDTO'
import { Login, LoginDTO } from '../src/dto/LoginDTO'
import { getJwt } from '../src/helpers/api-helper'

const ORDERS_URL = "https://backend.tallinn-learning.ee/orders"
const AUTH_URL = "https://backend.tallinn-learning.ee/login/student"

test('post order with correct data should receive code 201', async ({ request }) => {
  const token = await getJwt(request);

  console.log('token' + token)
  const response = await request.post(ORDERS_URL, {
    headers: {
      "Authorization": `Bearer ${token}`
    },
    data: OrderDTO.generateDefault()
  })
  const responseBody: OrderDTO = await response.json() //"age:20,title:'123'"
  const statusCode = response.status()

  console.log('response status:', statusCode)
  console.log('response body:', responseBody)
  expect(statusCode).toBe(StatusCodes.OK)
  const TestOrder = OrderSchema.parse(responseBody);
  expect(TestOrder.id).not.toBeUndefined()
})

test('get order with correct id should receive code 200', async ({ request }) => {
  const loginResponse = await request.post(AUTH_URL, {
    data: LoginDTO.generateCorrectPair(),
  })
  const token: Login = await loginResponse.text();

  const response = await request.post(ORDERS_URL, {
    headers: {
      "Authorization": `Bearer ${token}`
    },
    data: OrderDTO.generateDefault()
  })
  const responseBody: OrderDTO = await response.json()

  const responseSearch = await request.get(`${ORDERS_URL}/${responseBody.id}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    },
  })

  const responseBodySearch: OrderDTO = await responseSearch.json()
  const statusCode = responseSearch.status()
  expect(statusCode).toBe(200)
  const TestSearchOrder = OrderSchema.parse(responseBodySearch)
  expect(TestSearchOrder.id).not.toBeUndefined()
})


