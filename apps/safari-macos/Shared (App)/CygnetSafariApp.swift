import SwiftUI

@main
struct CygnetSafariApp: App {
    @StateObject private var extensionState = SafariExtensionState()

    var body: some Scene {
        WindowGroup {
            ContentView(extensionState: extensionState)
                .frame(minWidth: 460, minHeight: 360)
                .task {
                    await extensionState.refresh()
                }
        }
        .windowResizability(.contentSize)
    }
}
