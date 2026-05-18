export default function calcularCostoIngrediente(ing) {
    const comprada = parseFloat(ing.cantComprada)
    const usada = parseFloat(ing.cantUsada)
    const precio = parseFloat(ing.precioCompra)
    if (!comprada || !usada || !precio || comprada === 0) return null
    return (usada / comprada) * precio
}