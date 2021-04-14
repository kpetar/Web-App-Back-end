import { Body, Controller, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AddArticleToCartDto } from "src/dtos/cart/add.article.to.cart.dto";
import { editArticleInCartDto } from "src/dtos/cart/edit.article.in.cart.dto";
import { Cart } from "src/entities/cart.entity";
import { Order } from "src/entities/order.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { ApiResponse } from "src/misc/api.response.class";
import { RoleCheckerGuard } from "src/misc/role.checker.file";
import { CartService } from "src/services/cart/cart.service";
import { OrderService } from "src/services/order/order.service";

@Controller('api/cart')
export class CartController{
    constructor(
        private cartService:CartService,
        private orderService:OrderService
      ){}

      private async getActiveCartForUserId(userId:number):Promise<Cart>
      {
        let cart=await this.cartService.getLatestActiveCartByUserId(userId);

        if(!cart)
        {
            cart=await this.cartService.createNewCartForUser(userId);
        }

        return await this.cartService.getById(cart.cartId);
      }

      @Get()
      @UseGuards(RoleCheckerGuard)
      @AllowToRoles('user')
      async getCurrentCart(@Req() req:Request)
      {
          const userId=req.token.id;
          this.getActiveCartForUserId(userId);
      }

      @Post('addToCart')
      @UseGuards(RoleCheckerGuard)
      @AllowToRoles('user')
      async addToCart(@Body() data:AddArticleToCartDto, @Req() req:Request):Promise<Cart>
      {
        const cart=await this.getActiveCartForUserId(req.token.id);
        return await this.cartService.addArticleToCart(data.articleId, cart.cartId, data.quantity);
      }

      @Patch()
      @UseGuards(RoleCheckerGuard)
      @AllowToRoles('user')
      async changeQuantity(@Body() data:editArticleInCartDto, @Req() req:Request):Promise<Cart>
      {
        const cart=await this.getActiveCartForUserId(req.token.id);
        return await this.cartService.changeQuantity(cart.cartId, data.articleId, data.quantity);
      }

      @Post('makeAnOrder')
      async makeAnOrder(@Req() req:Request):Promise<Order|ApiResponse>
      {
          const cart=await this.getActiveCartForUserId(req.token.id);
          return await this.orderService.add(cart.cartId);
      }
      
}