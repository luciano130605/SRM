import { createPortal } from "react-dom"

export default function ModalEliminar({
    categoria,
    count,
    onConfirmar,
    onCancelar
}) {
    return createPortal(
        <div className="modal-backdrop">
            <div className="modal">
                <h3>Confirmar eliminación</h3>

                <p>
                    La categoría {categoria} está siendo usada por{" "}
                    {count} producto(s).
                    ¿Querés eliminarla igual?
                </p>

                <div className="modal-actions">
                    <button
                        className="btn-danger"
                        onClick={onConfirmar}
                    >
                        Eliminar
                    </button>
                    <button
                        className="btn-cancel"
                        onClick={onCancelar}
                    >
                        Cancelar
                    </button>


                </div>
            </div>
        </div>,
        document.body
    )
}