import {
  Registered,
  TokenURIUpdated,
} from "../generated/zkcredentials/zkcredentials"
import { User } from "../generated/schema"

export function handleRegistered(event: Registered): void {
  let token = User.load(event.params.user.toHexString());

  if (!token) {
    token = new User(event.params.user.toHexString());
  }
  token.cid = ''
  token.save()
}

export function handleTokenURIUpdated(event: TokenURIUpdated): void {
  let token = User.load(event.params.user.toHexString());

  if (!token) {
    token = new User(event.params.user.toHexString());
  }
  token.cid = event.params.tokenURI
  token.save()
}
