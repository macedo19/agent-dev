const cplusplusExample = `
#include <iostream>
#include <stdexcept>

double calcularDesconto(double valor, double percentual) {
    if (percentual < 0 || percentual > 100) {
        throw std::invalid_argument("Percentual invalido");
    }
    return valor * (1 - percentual / 100);
}

int main() {
    double resultado = calcularDesconto(1500.00, 20);
    std::cout << "Valor com desconto: " << resultado << std::endl;
    return 0;
}
`

export default cplusplusExample
