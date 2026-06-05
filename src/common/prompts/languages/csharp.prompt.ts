const csharpExample = `
using System;

public class DescontoService
{
    public decimal CalcularDesconto(decimal valor, decimal percentual)
    {
        if (percentual < 0 || percentual > 100)
            throw new ArgumentException("Percentual inválido");

        return valor * (1 - percentual / 100);
    }
}

class Program
{
    static void Main()
    {
        var service = new DescontoService();
        decimal resultado = service.CalcularDesconto(1500.00m, 20m);
        Console.WriteLine($"Valor com desconto: {resultado:F2}");
    }
}
`

export default csharpExample
