import Combine
import Foundation

@MainActor
final class SafariExtensionState: ObservableObject {
    @Published var isEnabled = false
    @Published var isRefreshing = false

    func refresh() async {
        isRefreshing = true
        isEnabled = await SafariConnector.extensionIsEnabled()
        isRefreshing = false
    }

    func openPreferences() async {
        await SafariConnector.openExtensionPrefs()
        await refresh()
    }
}
