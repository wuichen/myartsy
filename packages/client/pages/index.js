import React from 'react'
import styled from 'styled-components'
import { Button } from 'palette/dist'
const Title = styled.h1`
  font-size: 50px;
  color: ${({ theme }) => theme.colors.primary};
`

export default () => <Title>My page<Button>hey</Button></Title>
