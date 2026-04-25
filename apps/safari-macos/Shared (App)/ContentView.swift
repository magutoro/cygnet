import AppKit
import SwiftUI

struct ContentView: View {
    @ObservedObject var extensionState: SafariExtensionState

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text(AppConstants.appName)
                .font(.system(size: 28, weight: .semibold))

            Text("Japanese job application autofill for Safari on macOS.")
                .foregroundStyle(.secondary)

            statusCard

            VStack(alignment: .leading, spacing: 10) {
                Button("Open Safari Extension Settings") {
                    Task {
                        await extensionState.openPreferences()
                    }
                }
                .buttonStyle(.borderedProminent)

                Button("Refresh Extension Status") {
                    Task {
                        await extensionState.refresh()
                    }
                }
                .buttonStyle(.bordered)

                Button("Open Dashboard") {
                    NSWorkspace.shared.open(AppConstants.dashboardURL)
                }
                .buttonStyle(.bordered)
            }

            Divider()

            HStack(spacing: 16) {
                Link("Privacy Policy", destination: AppConstants.privacyURL)
                Link("Support", destination: AppConstants.supportURL)
            }
            .font(.callout)
            .foregroundStyle(.secondary)
        }
        .padding(24)
    }

    private var statusCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Extension status")
                .font(.headline)

            if extensionState.isRefreshing {
                Text("Checking whether the Safari extension is enabled…")
                    .foregroundStyle(.secondary)
            } else if extensionState.isEnabled {
                Text("Cygnet is enabled in Safari.")
                    .foregroundStyle(.green)
            } else {
                Text("Cygnet is installed but not enabled yet. Open Safari Extension Settings to turn it on.")
                    .foregroundStyle(.secondary)
            }

            Text("Bundle ID: \(AppConstants.extensionBundleIdentifier)")
                .font(.footnote.monospaced())
                .foregroundStyle(.secondary)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}
