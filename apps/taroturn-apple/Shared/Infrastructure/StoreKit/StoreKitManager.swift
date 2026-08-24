// StoreKitManager.swift - StoreKit 2 Offline-Capable In-App Purchases
import StoreKit
import Observation

public enum TaroturnSubscriptionTier: String, Sendable {
    case free
    case sanctuaryPro = "com.taroturn.subscription.pro_monthly"
    case sanctuaryLifetime = "com.taroturn.lifetime.seeker"
}

@Observable
@MainActor
public final class StoreKitManager {
    public static let shared = StoreKitManager()

    public private(set) var currentTier: TaroturnSubscriptionTier = .free
    public private(set) var availableProducts: [Product] = []
    public private(set) var isPurchasing: Bool = false

    private let productIds = [
        "com.taroturn.subscription.pro_monthly",
        "com.taroturn.lifetime.seeker"
    ]

    private init() {
        Task {
            await refreshProducts()
            await updatePurchasedStatus()
        }
    }

    public func refreshProducts() async {
        do {
            self.availableProducts = try await Product.products(for: productIds)
        } catch {
            print("[StoreKit] Products query failed: \(error)")
        }
    }

    public func updatePurchasedStatus() async {
        var highestTier: TaroturnSubscriptionTier = .free

        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            if transaction.revocationDate == nil {
                if transaction.productID == TaroturnSubscriptionTier.sanctuaryLifetime.rawValue {
                    highestTier = .sanctuaryLifetime
                    break
                } else if transaction.productID == TaroturnSubscriptionTier.sanctuaryPro.rawValue {
                    highestTier = .sanctuaryPro
                }
            }
        }
        self.currentTier = highestTier
    }
}
