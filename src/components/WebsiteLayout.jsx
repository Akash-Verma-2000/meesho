import BottomBar from "./BottomBar";
// import TopBar from "./TopBar";

export default function WebsiteLayout({ children }) {
    return (
        <>
            <main className="bg-gray-100 min-h-screen pb-20">
                {children}
            </main>
            <BottomBar />
        </>
    );
}