const goExample = `
package main

import "fmt"

func calcularDesconto(valor float64, percentual float64) float64 {
    if percentual < 0 || percentual > 100 {
        panic("percentual inválido")
    }
    return valor * (1 - percentual/100)
}

func main() {
    resultado := calcularDesconto(1500.00, 20)
    fmt.Printf("Valor com desconto: %.2f\\n", resultado)
}
`

export default goExample
