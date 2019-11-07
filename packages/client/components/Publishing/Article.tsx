import { Theme } from "@artsy/palette"
import React from "react"

import { BannerWrapper } from "Components/Publishing/Banner/Banner"
import { PixelTracker } from "Components/Publishing/Display/ExternalTrackers"
import { EditorialFeature } from "Components/Publishing/EditorialFeature/EditorialFeature"
import ArticleWithFullScreen from "Components/Publishing/Layouts/ArticleWithFullScreen"
import { ClassicLayout } from "Components/Publishing/Layouts/ClassicLayout"
import { FeatureLayout } from "Components/Publishing/Layouts/FeatureLayout"
import { NewsLayout } from "Components/Publishing/Layouts/NewsLayout"
import { SeriesLayout } from "Components/Publishing/Layouts/SeriesLayout"
import { StandardLayout } from "Components/Publishing/Layouts/StandardLayout"
import { VideoLayout } from "Components/Publishing/Layouts/VideoLayout"
import { FullScreenProvider } from "Components/Publishing/Sections/FullscreenViewer/FullScreenProvider"
import { TooltipsDataProvider } from "Components/Publishing/ToolTip/TooltipsDataProvider"
import { ArticleData } from "Components/Publishing/Typings"
import { Bling as GPT } from "react-gpt"
import track, { TrackingProp } from "react-tracking"
import { MediaContextProvider } from "Utils/Responsive"
import Events from "../../Utils/Events"

GPT.enableSingleRequest()

export interface ArticleProps {
  articleSerial?: number
  article: ArticleData
  backgroundColor?: string
  color?: string
  customEditorial?: string
  relatedArticles?: any
  relatedArticlesForPanel?: any
  relatedArticlesForCanvas?: any
  renderTime?: number
  seriesArticle?: ArticleData
  isHovered?: boolean
  isLoggedIn?: boolean
  isMobile?: boolean
  isTablet?: boolean
  infiniteScrollEntrySlug?: string
  isSuper?: boolean
  isTruncated?: boolean
  emailSignupUrl?: string
  headerHeight?: string
  marginTop?: string | null
  showTooltips?: boolean
  showCollectionsRail?: boolean
  slideIndex?: number
  tracking?: TrackingProp
  closeViewer?: () => void
  viewerIsOpen?: boolean
  onOpenAuthModal?: (type: "register" | "login", config: object) => void
  onExpand?: () => void
  shouldAdRender?: boolean
}

@track(
  (props: ArticleProps) => {
    return {
      page: "Article",
      entity_type: "article",
      entity_id: props.article.id,
    }
  },
  {
    dispatch: data => Events.postEvent(data),
  }
)
export class Article extends React.Component<ArticleProps> {
  getArticleLayout = () => {
    const { article, customEditorial } = this.props

    if (customEditorial) {
      if (article.layout !== "series") {
        return (
          <FullScreenProvider>
            <ArticleWithFullScreen {...this.props}>
              <EditorialFeature {...this.props} />
            </ArticleWithFullScreen>
          </FullScreenProvider>
        )
      } else {
        return <EditorialFeature {...this.props} />
      }
    } else {
      switch (article.layout) {
        case "classic": {
          return <ClassicLayout {...this.props} />
        }
        case "feature": {
          return (
            <FullScreenProvider>
              <ArticleWithFullScreen {...this.props}>
                <FeatureLayout {...this.props} />
              </ArticleWithFullScreen>
            </FullScreenProvider>
          )
        }
        case "series": {
          return <SeriesLayout {...this.props} />
        }
        case "video": {
          return <VideoLayout {...this.props} />
        }
        case "news": {
          return <NewsLayout {...this.props} />
        }
        default: {
          return (
            <FullScreenProvider>
              <ArticleWithFullScreen {...this.props}>
                <StandardLayout {...this.props} />
              </ArticleWithFullScreen>
            </FullScreenProvider>
          )
        }
      }
    }
  }

  shouldRenderSignUpCta = () => {
    const { article, isLoggedIn, isTruncated, isMobile } = this.props

    return (
      isMobile && article.layout !== "series" && !isLoggedIn && !isTruncated
    )
  }

  sponsorPixelTrackingCode = article => {
    if (article.sponsor && article.sponsor.pixel_tracking_code) {
      return article.sponsor
    } else if (
      article.seriesArticle &&
      article.seriesArticle.sponsor &&
      article.seriesArticle.sponsor.pixel_tracking_code
    ) {
      return article.seriesArticle.sponsor
    }
  }

  render() {
    const { article } = this.props
    const trackingCode = this.sponsorPixelTrackingCode(article)

    return (
      <MediaContextProvider>
        <Theme>
          <TooltipsDataProvider {...this.props}>
            {this.getArticleLayout()}
            {trackingCode && (
              <PixelTracker unit={trackingCode} date={this.props.renderTime} />
            )}
            {this.shouldRenderSignUpCta() && (
              <BannerWrapper article={article} />
            )}
          </TooltipsDataProvider>
        </Theme>
      </MediaContextProvider>
    )
  }
}
