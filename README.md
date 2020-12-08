# gatsby-plugin-drupal-18next

Gatsby plugin for sourcing, writing and using Drupal interface translations with i18next.

Pulls and pushes interface translations tagged wih the context "Decoupled Translations" from Drupal sites with the
[Drupal Decoupled Interface Translations module](https://www.drupal.org/project/decoupled_interface_translations) installed.

## Install

`yarn add gatsby-plugin-drupal-18next`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-drupal-i18next",
      options: {
        baseUrl: "http://decoupled-translations.ddev.site/",
        basicAuth: {
          username: process.env.DRUPAL_BASIC_AUTH_USERNAME,
          password: process.env.DRUPAL_BASIC_AUTH_PASSWORD,
        },
        // Optionally set i18next options
        i18nextOptions: {
          keySeparator: false, // we do not use keys in form of messages.welcome
          interpolation: {
            escapeValue: false, // react already saves us from xss
          },
          react: {
            useSuspense: false,
          },
        },
        // Optionally set i18next-scanner options
        i18nextScannerOptions: {
          input: [
            "./src/pages/*.{js,jsx,ts,tsx}",
            "./src/components/*.{js,jsx,ts,tsx}",
            "./src/templates/*.{js,jsx,ts,tsx}",
          ],
          output: "./i18n/locales",
        },
      },
    },
  ],
}
```

Then in your components, templates and pages you can import react-i18next and use the `t` function provided by the `useTranslation` hook to start using translated string.

Example usage in a Gatsby template:

```
import * as React from "react"
import { graphql, PageProps } from "gatsby"
import { Layout } from "../components/layout"
import { useTranslation } from "react-i18next"
import { RecipeDetailsQuery } from "../../graphql-types"

export const query = graphql`
  query RecipeDetails($id: String!, $langcode: String!) {
    translations: allNodeRecipe(filter: { drupal_id: { eq: $id } }) {
      nodes {
        path {
          alias
        }
        langcode
      }
    }
    content: nodeRecipe(drupal_id: { eq: $id }, langcode: { eq: $langcode }) {
      title
      field_summary {
        value
      }
      field_recipe_instruction {
        processed
      }
    }
  }
`

const RecipeDetailsPage: React.FC<PageProps & { data: RecipeDetailsQuery }> = ({
  data,
}) => {
  const { t } = useTranslation()
  return (
    <Layout translations={data.translations}>
      <h1>{data.content.title}</h1>
      <p>{data.content.field_summary.value}</p>
      <h2>{t("Method")}</h2>
      <p
        dangerouslySetInnerHTML={{
          __html: data.content.field_recipe_instruction.processed,
        }}
      />
    </Layout>
  )
}

export default RecipeDetailsPage

```

## The build process

- Interface translations are fetched from `${pluginOptions.baseUrl}decoupled-interface-translations/` (a route defined by the associated Drupal module) in the `sourceNodes` Gatsby Node API
- Interface translations are pushed to `${pluginOptions.baseUrl}decoupled-interface-translations/add` in the `postBuild` Gatsby Node API. This means translations will only get pushed to when running `gatsby build`.
