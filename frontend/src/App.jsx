import { useState } from 'react'
import Productos from "../src/components/productos/productos"
import Clientes from "./components/clientes/clientes"
import Dashboard from "./components/dashboard/dashboard"
import Pedidos from "./components/pedidos/pedidos"

function App() {
    const [vista, setVista] = useState('productos')

    const renderVista = () => {
        switch (vista) {
            case 'productos':
                return <Productos />
            case 'clientes':
                return <Clientes />
            case 'dashboard':
                return <Dashboard />
            case 'pedidos':
                return <Pedidos />
            default:
                return <Productos />
        }
    }

    return (
        <div>
            <select
                value={vista}
                onChange={(e) => setVista(e.target.value)}
            >
                <option value="productos">Productos</option>
                <option value="clientes">Clientes</option>
                <option value="dashboard">Dashboard</option>
                <option value="pedidos">Pedidos</option>
            </select>

            <div style={{ marginTop: '20px' }}>
                {renderVista()}
            </div>
        </div>
    )
}

export default App