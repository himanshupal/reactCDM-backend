const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

const permitted = [`Director`, `Head of Department`];

module.exports = async (_, { _id }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { access } = await authenticate(authorization);
		if (!permitted.includes(access)) throw new ForbiddenError(`Access Denied ⚠`);

		const { deletedCount } = await client
			.db(dbName)
			.collection(`teachers`)
			.deleteOne({ _id: ObjectId(_id) });

		if (!deletedCount)
			throw new UserInputError(`Unknown Error ⚠`, {
				error: `Error deleting teacher. Please try again or contact admin if issue persists.`,
			});

		return true;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
