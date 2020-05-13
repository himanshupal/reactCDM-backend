const {
		ApolloServer,
		UserInputError,
		ForbiddenError,
		AuthenticationError,
	} = require(`apollo-server`),
	{ MongoClient, ObjectID } = require(`mongodb`);

exports.client = new MongoClient(process.env.mongo_local, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
	.connect()
	.catch((err) => console.error(err));

exports.ObjectId = ObjectID;
exports.Error = UserInputError;
exports.Forbidden = ForbiddenError;
exports.AuthError = AuthenticationError;

const typeDefs = require(`./typeDefs`),
	resolvers = require(`./resolvers/index`);

new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req }) => req,
	tracing: true,
})
	.listen((PORT = process.env.PORT || 80))
	.then(({ url }) => {
		console.log(`Server ready at ${url}`);
	})
	.catch((err) => console.error(err));
