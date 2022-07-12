import { Router } from "express";
import apiController from "../controllers/apiController";

const router=Router()

router.post('/create-menu',apiController.createMenu)
router.post('/create-category',apiController.createCategory)
router.post('/create-dish',apiController.createDish)
router.get('/all-menus',apiController.getAllMenus)
router.get('/all-categories',apiController.getAllCategories)
router.get('/all-dishes',apiController.getAllDishes)  
router.delete('/del-dish/:id',apiController.delDishById)
router.delete('/del-category/:id',apiController.delCategoryById)
router.delete('/del-menu/:id',apiController.delMenuById)

export default router 