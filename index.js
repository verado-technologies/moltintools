var exports = (module.exports = {});

require("dotenv").config();
const csv = require("csvtojson");
const MoltinGateway = require("@moltin/sdk").gateway;
const Moltin = MoltinGateway({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET
});

const [file, command] = process.argv.reverse();
const catalogue = csv().fromFile(file);
const waitFor = n => new Promise(resolve => setTimeout(resolve, n));

// Invoke function based on supplied argument
(async () => {
  switch (command) {
    case "create":
      await createProduct();
      break;
    case "update":
      updateProduct();
      break;
    case "delete":
      await deleteProduct();
      break;
    default:
      return console.log(
        "Please supply a valid command such as create, update or delete."
      );
  }
})();

function bool(answer) {
  if (answer == "Yes") {
    return true;
  } else return false;
}

// Creates a product
async function createProduct() {
  const products = await catalogue;
  for (const item of products) {
    await waitFor(2000);
    Moltin.Products.Create({
      type: "product",
      //'vendor': `{'id': 'LbdCVOGuS0XEyOiYsJYu5t3qFqs1','name': '${humanNames.maleRandom()}'}`,
      name: item.model,
      brand: item.brand,
      slug: item.slug,
      sku: item.sku,
      description: item.description,
      manage_stock: true,
      price: [
        {
          amount: Number(item.watchr_price) * 100,
          currency: "GBP",
          includes_tax: true
        }
      ],
      status: "live",
      stock: 1,
      commodity_type: "physical",
      clasp_type: item.clasp_type,
      bracelet_color: item.bracelet_color,
      bracelet_material: item.bracelet_material,
      gemstones: item.gemstones,
      dial_color: item.dial_color,
      crystal: item.crystal,
      case_material: item.case_material,
      case_size: item.case_size,
      movement: item.movement,
      year: item.year,
      papers: bool(item.papers),
      box: bool(item.box),
      ref: item.ref,
      model: item.model,
      dealer_link: item.dealer_link,
      gender: item.gender,
      serviced: bool(item.serviced),
      service_year: item.service_year,
      service_receipt: item.service_receipt,
      original_purchase_receipt: item.original_purchase_receipt,
      functions: item.functions,
      additional_options: item.additional_options,
      images: item.img_link
    }).then(done => {
      console.log(
        `product ${done.data.name} with the ID of ${
          done.data.id
        } has beeen created.`
      );
    });
  }
}

// Updates a product
async function updateProduct() {
  const products = await catalogue;
  for (const item of products) {
    await waitFor(2000);
    Moltin.Products.Filter({ eq: { sku: item.sku } })
      .All()
      .then(update => {
        Moltin.Products.Update(update.data[0].id, {
          id: update.data[0].id,
          slug: item.cleanedslug
        })
          .then(fin => {
            console.log(fin, "Done");
          })
          .catch(function(error) {
            console.log(error);
          });
      });
  }
}

// Deletes a product
async function deleteProduct() {
  const products = await catalogue;
  for (const item of products) {
    await waitFor(2000);
    Moltin.Products.Filter({ eq: { sku: item.sku } })
      .All()
      .then(async remove => {
        console.log(`Product ${item.sku} has been deleted.`);
        try {
          await Moltin.Products.Delete(remove.data[0].id);
        } catch (e) {
          console.error(e);
        }
      });
  }
}
