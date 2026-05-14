export default function iniciales(nombre = '') {
    return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'

}