import SafariServices

enum SafariConnector {
    static func extensionIsEnabled() async -> Bool {
        do {
            return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Bool, Error>) in
                SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: AppConstants.extensionBundleIdentifier) { state, error in
                    if let error {
                        continuation.resume(throwing: error)
                        return
                    }

                    continuation.resume(returning: state?.isEnabled ?? false)
                }
            }
        } catch {
            return false
        }
    }

    static func openExtensionPrefs() async {
        do {
            try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
                SFSafariApplication.showPreferencesForExtension(withIdentifier: AppConstants.extensionBundleIdentifier) { error in
                    if let error {
                        continuation.resume(throwing: error)
                        return
                    }

                    continuation.resume()
                }
            }
        } catch {
            return
        }
    }
}
