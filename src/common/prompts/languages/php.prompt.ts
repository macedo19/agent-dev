const phpExample = `
<?php

function calcularDesconto(float $valor, float $percentual): float {
    if ($percentual < 0 || $percentual > 100) {
        throw new InvalidArgumentException("Percentual inválido");
    }
    return $valor * (1 - $percentual / 100);
}

$resultado = calcularDesconto(1500.00, 20);
echo "Valor com desconto: " . number_format($resultado, 2) . PHP_EOL;
`

export default phpExample
