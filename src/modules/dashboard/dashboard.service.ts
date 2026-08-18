import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from 'src/model/order.model';
import { Product } from 'src/model/product.model';
import { User } from 'src/model/user.model';
import { Cart } from 'src/model/cart.model';
import { PaymentStatusEnum } from 'src/common/enum/order.enum';
import { RoleEnum } from 'src/common/enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
  ) {}

  async getStats() {
    // Total Sales & Revenue (Paid Orders)
    const paidOrders = await this.orderModel.find({
      paymentStatus: PaymentStatusEnum.PAID,
    });
    const totalSales = paidOrders.length;
    const revenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Number of orders
    const totalOrders = await this.orderModel.countDocuments();

    // Total products sold
    let totalProductsSold = 0;
    paidOrders.forEach((order) => {
      order.items?.forEach((item) => {
        totalProductsSold += item.quantity || 0;
      });
    });

    // Current inventory / Stock & Out of Stock / Low Stock
    const products = await this.productModel.find();
    let currentInventory = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;

    products.forEach((product) => {
      currentInventory += product.stock || 0;
      if (product.stock === 0) {
        outOfStockCount++;
      } else if (
        product.lowStockThreshold !== undefined &&
        product.stock <= product.lowStockThreshold
      ) {
        lowStockCount++;
      } else if (product.stock <= 5) {
        lowStockCount++;
      }
    });

    // Total users
    const totalUsers = await this.userModel.countDocuments({
      role: RoleEnum.USER,
    });

    // Cart metrics: Active carts with items, total items in carts, total value in carts
    const activeCarts = await this.cartModel.find({
      'items.0': { $exists: true },
    });
    const totalActiveCarts = activeCarts.length;
    let totalCartItems = 0;
    let totalCartValue = 0;

    activeCarts.forEach((cart) => {
      totalCartValue += cart.total || cart.subtotal || 0;
      cart.items?.forEach((item) => {
        totalCartItems += item.quantity || 0;
      });
    });

    // Wishlist metrics: Users with wishlist entries and total wishlist items
    const usersWithWishlist = await this.userModel.find({
      'wishlist.0': { $exists: true },
    });
    const totalUsersWithWishlist = usersWithWishlist.length;
    let totalWishlistItems = 0;
    usersWithWishlist.forEach((u) => {
      totalWishlistItems += u.wishlist?.length || 0;
    });

    return {
      totalSales,
      totalOrders,
      totalProductsSold,
      currentInventory,
      outOfStockCount,
      lowStockCount,
      revenue,
      totalUsers,
      // Cart Details
      totalActiveCarts,
      totalCartItems,
      totalCartValue,
      // Wishlist Details
      totalWishlistItems,
      totalUsersWithWishlist,
    };
  }

  async getRecentOrders() {
    return this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'firstName lastName email')
      .exec();
  }

  async getBestSellingProducts() {
    const bestSellers = await this.orderModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'Ecommerce_APP_PRODUCTS',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          title: '$productInfo.title',
          price: '$productInfo.price',
          stock: '$productInfo.stock',
          images: '$productInfo.images',
        },
      },
    ]);

    return bestSellers;
  }

  /** Detailed breakdown of items in carts and wishlists */
  async getCartWishlistAnalytics() {
    // 1. Most wishlisted products
    const topWishlisted = await this.userModel.aggregate([
      { $match: { 'wishlist.0': { $exists: true } } },
      { $unwind: '$wishlist' },
      {
        $group: {
          _id: '$wishlist',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'Ecommerce_APP_PRODUCTS',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          count: 1,
          title: '$product.title',
          price: '$product.price',
          stock: '$product.stock',
          images: '$product.images',
        },
      },
    ]);

    // 2. Most added items in active carts
    const topInCarts = await this.cartModel.aggregate([
      { $match: { 'items.0': { $exists: true } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          cartCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'Ecommerce_APP_PRODUCTS',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          cartCount: 1,
          title: '$product.title',
          price: '$product.price',
          stock: '$product.stock',
          images: '$product.images',
        },
      },
    ]);

    // 3. Active live carts summary
    const liveCarts = await this.cartModel
      .find({ 'items.0': { $exists: true } })
      .sort({ updatedAt: -1 })
      .limit(8)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'title images price')
      .exec();

    return {
      topWishlisted,
      topInCarts,
      liveCarts,
    };
  }
}
