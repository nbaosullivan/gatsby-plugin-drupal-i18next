import { graphql, useStaticQuery } from "gatsby"

export const useDrupalTranslations = () => {
  const data = useStaticQuery(
    graphql`
      query DrupalTranslations {
        allDrupalTranslation {
          nodes {
            source
            translation
            langcode
          }
        }
      }
    `
  )
  return data.allDrupalTranslation.nodes
}
