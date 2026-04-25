import Foundation

enum AppConstants {
    static let appName = "Cygnet Safari"
    static let dashboardURL = URL(string: "https://cygnet-two.vercel.app/dashboard")!
    static let privacyURL = URL(string: "https://cygnet-two.vercel.app/privacy")!
    static let supportURL = URL(string: "https://cygnet-two.vercel.app/contact")!

    static let extensionBundleIdentifier: String = {
        if let value = Bundle.main.object(forInfoDictionaryKey: "CygnetSafariExtensionBundleIdentifier") as? String,
           !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return value
        }

        return "com.example.cygnet.safari.extension"
    }()
}
