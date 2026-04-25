import Foundation
import SafariServices
import os.log

final class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    func beginRequest(with context: NSExtensionContext) {
        os_log(.default, "Safari web extension host request received.")
        context.completeRequest(returningItems: nil, completionHandler: nil)
    }
}
