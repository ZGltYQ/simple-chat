import Drawer from "@/widgets/Drawer"
import AppBar from "@/widgets/AppBar"
import Settings from "@/widgets/Settings"
import Chat from "@/widgets/Chat"

export default function ChatPage() {
    return (
        <>
            <AppBar>
                <Settings />
            </AppBar>
            <Drawer />
            <Chat/>
        </>
    )
}