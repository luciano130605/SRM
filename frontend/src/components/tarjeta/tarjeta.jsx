export default function Tarjeta({
    className = '',
    editando = false,
    topClassName = '',
    infoClassName = '',
    actionsClassName = '',
    header,
    actions,
    editContent,
    children,
}) {
    const cardClassName = `${className}${editando ? ' editando' : ''}`.trim()

    return (
        <article className={cardClassName}>
            <div className={topClassName}>
                <div className={infoClassName}>
                    {header}
                </div>

                <div className={actionsClassName}>
                    {actions}
                </div>
            </div>

            {editando ? editContent : children}
        </article>
    )
}

