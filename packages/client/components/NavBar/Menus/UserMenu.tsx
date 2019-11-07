import React, { useContext } from "react"

import {
  Box,
  Flex,
  HeartIcon,
  Menu,
  MenuItem,
  PowerIcon,
  Separator,
  SettingsIcon,
  SoloIcon,
} from "@artsy/palette"

import { AnalyticsSchema, SystemContext } from "Artsy"
import { useTracking } from "Artsy/Analytics/useTracking"
import { data as sd } from "sharify"
import { userIsAdmin } from "Utils/user"
import * as authentication from "../Utils/authentication"

export const UserMenu: React.FC = () => {
  const { trackEvent } = useTracking()
  const { mediator, user } = useContext(SystemContext)

  const trackClick = event => {
    const link = event.target
    const text = link.innerText
    const href = link.parentNode.parentNode.getAttribute("href")

    trackEvent({
      action_type: AnalyticsSchema.ActionType.Click,
      context_module: AnalyticsSchema.ContextModule.HeaderUserDropdown,
      subject: text,
      destination_path: href,
    })
  }

  const isAdmin = userIsAdmin(user)
  const hasPartnerAccess = Boolean(user.has_partner_access)

  return (
    <Menu onClick={trackClick}>
      {isAdmin && <MenuItem href={sd.ADMIN_URL}>Admin</MenuItem>}
      {(isAdmin || hasPartnerAccess) && (
        <MenuItem href={sd.CMS_URL}>CMS</MenuItem>
      )}
      {(isAdmin || hasPartnerAccess) && (
        <Flex width="100%" justifyContent="center" my={1}>
          <Box width="90%">
            <Separator />
          </Box>
        </Flex>
      )}

      <MenuItem href="/user/saves">
        <HeartIcon mr={1} /> Saves & Follows
      </MenuItem>
      <MenuItem href="/profile/edit">
        <SoloIcon mr={1} /> Collector Profile
      </MenuItem>
      <MenuItem href="/user/edit">
        <SettingsIcon mr={1} /> Settings
      </MenuItem>
      <MenuItem
        onClick={event => {
          event.preventDefault() // `href` is only for tracking purposes
          authentication.logout(mediator)
        }}
      >
        <PowerIcon mr={1} /> Log out
      </MenuItem>
    </Menu>
  )
}
