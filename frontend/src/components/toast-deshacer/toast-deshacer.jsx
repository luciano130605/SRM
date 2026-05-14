import Toast from "../toast/toast"

export default function ToastDeshacer({ mensaje, onDeshacer }) {
    return <Toast mensaje={mensaje} accion={onDeshacer} textoAccion="Deshacer" />
}
