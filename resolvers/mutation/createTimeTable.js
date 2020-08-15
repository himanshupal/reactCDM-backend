const { ForbiddenError, UserInputError } = require("apollo-server"),
	{ MongoClient } = require(`mongodb`),
	authenticate = require(`../../checkAuth`)

const accessAllowed = [`Director`, `Head of Department`]

module.exports = async (_, { className, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	try {
		await client.connect()
		const user = await authenticate(authorization)
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`)
		const checkClassExists = await client.db(`RBMI`).collection(`timetable`).findOne({ className })
		if (checkClassExists)
			throw new UserInputError(`Already saved ⚠`, {
				error: `Time Table already exists for selected class. Consider updating it.`,
			})
		data = data.filter((x) => x.from && x.to)
		const res = await client.db(`RBMI`).collection(`timetable`).insertOne({
			className,
			subjects: data,
			createdAt: Date.now(),
			createdBy: user.username,
		})
		return res.insertedCount > 0
			? `Time Table successfully created ✔`
			: `There was some error saving data. Please try again or contact admin if issue persists.`
		return res
	} catch (error) {
		return error
	} finally {
		await client.close()
	}
}
