import connectDB from './mongodb'

/** MongoDB 健康检查 */
export async function mongoPing(): Promise<boolean> {
    try {
        const mongoose = await connectDB()
        await mongoose.connection.db.admin().ping()
        return true
    } catch {
        return false
    }
}