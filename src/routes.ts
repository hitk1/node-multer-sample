import multer from 'multer'
import { Router, Request, Response } from 'express'
import { celebrate, Joi, Segments } from 'celebrate'
import { resolve as pathResolver } from 'path'
import { randomBytes } from 'crypto'

const storageTypes = <any>{
    local: multer.diskStorage({
        destination: (request, file, callback) => {
            callback(null, pathResolver(__dirname, '..', 'tmp', 'uploads'))
        },
        filename: (request, file, callback) => {
            const hash = randomBytes(16).toString('hex')

            //@ts-ignore
            file.key = `${hash}-${file.originalname}`  // Este attr 'key' pode ser usado mais tarde para salvar o nome modificado do arquivo
            //@ts-ignore
            callback(null, file.key)
        }
    }),

    //É possível configurar um outro ambiente para upload dos arquvos, como por exemplo S3 da amazon
    //saber mais sobre isso, na lib: "multer-s3"
}

const multerConfig = <multer.Options>{
    dest: pathResolver(__dirname, '..', 'tmp', 'uploads'),
    limits: {
        fileSize: 2 * 1024 * 1024 //limit do tamanho do arquivo
    },
    fileFilter: (request, file, callback) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/pjpeg",
            "image/png",
            "image/gif",
            "text/csv"
        ]

        if (allowedMimeTypes.includes(file.mimetype))
            callback(null, true)
        else
            callback(new Error("Tipo de arquivo inválido."))
    },
    storage: storageTypes[process.env.STORAGE_TYPE! || 'local']

}

const routes = Router()


routes.post(
    '/upload',
    multer(multerConfig).single('file'),
    celebrate({
        [Segments.BODY]: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            age: Joi.number().required()
        })
    }, { abortEarly: false }),
    (request: Request, response: Response) => {
        return response.json({ ok: true })
    }
)

export { routes }