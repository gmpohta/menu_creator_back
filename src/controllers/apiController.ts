import { PrismaClient, Prisma } from '@prisma/client'
const prisma = new PrismaClient()
import path from 'path'
const fs = require("fs")

class apiController{
    async getAllMenus(req: any, res: any){
        /*[{
            menuId,
            date,
            links:[{
                categoryId:1,
                name:'Десерт',
                dishes:[{},{}]
                },
                {}
            ]
        }]*/
        async function queryDish(menuId:any) {
            return await prisma.$queryRaw
            `SELECT *
            FROM "Dish"
            WHERE "Dish".id IN (
                SELECT "Bind"."dishId" 
                FROM "Bind" INNER JOIN
                "Category" ON "Category".id = "Bind"."categoryId"
                WHERE "Bind"."menuId" = ${Number(menuId)} 
            )`
        }
        async function queryCat(menuId:any) {
            return await prisma.$queryRaw
            `SELECT DISTINCT ON("Category".id) "Category".name, "Category".id 
            FROM "Category" INNER JOIN
            "Bind" ON "Category".id = "Bind"."categoryId"
            WHERE "Bind"."menuId" = ${Number(menuId)} 
            `
        }
        async function resultQuery(menus:any) {
            let result=[]
            let categories:any =[]
            for (const item of menus) {
              categories=await queryCat(item.id)
              let links=[]
              for(const catItem of categories){
                const dishes=await queryDish(item.id)
                links.push({...catItem,dishes})
              }
              result.push({...item,links})
            }
            return result
        }
        try{
            const menus = await prisma.menu.findMany({})
            let result = []
            if (menus.length){
                result = await resultQuery(menus)
            }
            res.status(200).json(
                result
            )
        }catch(err){
            res.status(500).send(err)
        }
    }   

    async getAllCategories(req: any, res: any){
        /*[{id:1,
            name:'Десерты'}]*/
        try{
            const allCategories = await prisma.category.findMany({
            })
            res.status(200).json(
                allCategories
            )
        }catch(err){
            res.status(500).send(err)
        }
    }   

    async getAllDishes(req: any, res: any){
        /*[{
            id:1,
            name:'Булочка',
            weight:100,
            price:25,
            description:'Мягкая французская булочка, к чаю'
            image:"public/1452222.png"
        }]*/
        try{
            const allDishes = await prisma.dish.findMany({})
            res.status(200).json(
                allDishes
            )
        }catch(err){
            res.status(500).send(err)
        }
    }

    async createCategory(req: any, res: any){
        try{
            const result = await prisma.category.create({
                data: { ...req.body },
            })
            res.status(200).json(
                result
            )
        }catch(err){
            res.status(500).send(err)
        }
    }   

    async createMenu(req: any, res: any){ 
        try{
            let toCreate={date:new Date}
            toCreate.date=req.body.date
            const result = await prisma.menu.create({
                data: {...toCreate},
            })
            
            const promises=[]
            for (let obj of req.body.links){ 
                promises.push(
                    prisma.bind.create({
                        data: { ...obj, menuId:result.id },
                    })
                )
            }
            Promise.all(promises)
            .then(val => {
                res.status(200).json(
                    result
                )
            })
            .catch(err=>{
                res.status(500).send(err)
            })
        }catch(err){
            res.status(500).send(err)
        }
    }   

    async createDish(req: any, res: any){
        try{
            let dataToCreate=JSON.parse(req.body.dish)
            if (!req.files){
                dataToCreate.image='defolt.png'
            }else{
                let image=req.files.image
                const possibleExt=['.png','.jpg','.jpeg','.bmp','.gif']
                const ext=path.extname(image.name).toLowerCase()

                if (image.size<=1000000000000 && possibleExt.map(el=>el===ext).findIndex(el=>el===true)!==-1){
                    image.name=String(Date.now())+ext
                    const targetPath = path.resolve('./')+'/public/'+image.name
                    image.mv(targetPath)
                    dataToCreate.image=image.name
                }else{
                    res.status(400).json(
                        "Image too big or wrong extension"
                    )
                }
            } 
            const result = await prisma.dish.create({
                data: { ...dataToCreate }
            })
            res.status(200).json(
                result
            )
        }catch(err){
            res.status(500).send(err)
        }
    }   
    
    async delMenuById(req: any, res: any){ 
        const { id } = req.params

        try{
            await prisma.menu.delete({
                where: { id: Number(id)},
            })
            
            res.status(200).json(
                "succes"
            )
        }catch(err){
            res.status(500).send(err)
        }
    } 

    async delDishById(req: any, res: any){
        const { id } = req.params
        try{
            let dish:any={}
            dish=await prisma.dish.findFirst({
                where: { id: Number(id)},
            })
            const imgPath = path.resolve('./')+'/public/'+dish.image

            await prisma.dish.delete({
                where: { id: Number(id)},
            })
            if (dish.image!=='defolt.png'){
                try{
                    fs.unlinkSync(imgPath)
                }catch(err){
                    console.log(err)
                }   
            }
            const result = await prisma.dish.findMany({})
            res.status(200).json(
                result 
            ) 
        }catch(err){
            res.status(500).send(err)
        }
    }

    async delCategoryById(req: any, res: any){
        const { id } = req.params
        try{
            await prisma.category.delete({
                where: { id: Number(id)},
            })
            const result = await prisma.category.findMany({})
            res.status(200).json(
                result
            )
        }catch(err){
            res.status(500).send(err)
        }
    }
}

export default new apiController()
