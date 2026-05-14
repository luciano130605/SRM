import { useState } from 'react'
import Productos from "../src/components/productos/productos"
import Clientes from "./components/clientes/clientes"
import Dashboard from "./components/dashboard/dashboard"
import Pedidos from "./components/pedidos/pedidos"
import Header from "./components/header/header"
import "./App.css"

export default function App() {
    const [vista, setVista] = useState('dashboard')

    const renderVista = () => {
        switch (vista) {
            case 'dashboard':
                return <Dashboard />
            case 'productos':
                return <Productos />
            case 'clientes':
                return <Clientes />
            case 'pedidos':
                return <Pedidos />
            default:
                return <Dashboard />
        }
    }

    return (
        <div className="app-shell">
            <Header vista={vista} setVista={setVista} />

            <main className="app-main">
                {renderVista()}
            </main>
        </div>
    )
}

