const { ApolloServer, UserInputError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`);

exports.client = new MongoClient(process.env.mongo_local, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
	.connect()
	.catch((err) => console.error(err));

exports.Error = UserInputError;

const typeDefs = require(`./typeDefs`),
	resolvers = require(`./resolvers/index`);

new ApolloServer({
	typeDefs,
	resolvers,
	tracing: true,
})
	.listen((PORT = process.env.PORT || 80))
	.then(({ url }) => {
		console.log(`Server ready at ${url}`);
	})
	.catch((err) => console.error(err));
